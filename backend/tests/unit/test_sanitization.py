import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
from app.utils.sanitization import sanitize_string, sanitize_recursive


class TestSanitization:
    def test_sanitize_plain_text(self):
        assert sanitize_string("Hello World") == "Hello World"

    def test_sanitize_html_script(self):
        result = sanitize_string("<script>alert('xss')</script>")
        assert "&lt;script&gt;" in result
        assert "<script>" not in result

    def test_sanitize_html_tags(self):
        result = sanitize_string("<b>bold</b>")
        assert "&lt;b&gt;" in result

    def test_sanitize_special_chars(self):
        result = sanitize_string("a & b < c > d \"quote\" 'single'")
        assert "&amp;" in result
        assert "&lt;" in result
        assert "&gt;" in result
        assert "&quot;" in result
        assert "&#x27;" in result

    def test_sanitize_recursive_dict(self):
        data = {"name": "<script>alert(1)</script>", "age": 25}
        result = sanitize_recursive(data)
        assert "&lt;script&gt;" in result["name"]
        assert result["age"] == 25

    def test_sanitize_recursive_list(self):
        data = ["<script>", "normal", "<img src=x onerror=alert(1)>"]
        result = sanitize_recursive(data)
        assert "&lt;script&gt;" in result[0]
        assert result[1] == "normal"
        assert "&lt;img" in result[2]

    def test_sanitize_recursive_nested(self):
        data = {
            "user": {
                "name": "<b>admin</b>",
                "posts": ["<p>post1</p>", "<p>post2</p>"],
            }
        }
        result = sanitize_recursive(data)
        assert "&lt;b&gt;" in result["user"]["name"]
        assert "&lt;p&gt;" in result["user"]["posts"][0]

    def test_sanitize_none_value(self):
        assert sanitize_string(None) is None

    def test_sanitize_empty_string(self):
        assert sanitize_string("") == ""
