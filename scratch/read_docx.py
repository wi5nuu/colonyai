import zipfile
import xml.etree.ElementTree as ET
import os

def extract_docx_text(docx_path, output_txt_path):
    if not os.path.exists(docx_path):
        print(f"Error: File {docx_path} does not exist!")
        return False
        
    try:
        # docx is actually a zip file. Let's open it.
        with zipfile.ZipFile(docx_path) as docx:
            # Main text content is inside word/document.xml
            xml_content = docx.read('word/document.xml')
            
            root = ET.fromstring(xml_content)
            
            # Namespaces
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            
            # Find all paragraph elements <w:p>
            for p in root.findall('.//w:p', ns):
                paragraph_text = []
                # Find all text elements <w:t> inside each paragraph
                for t in p.findall('.//w:t', ns):
                    if t.text:
                        paragraph_text.append(t.text)
                
                # Combine the text runs and add to paragraphs
                text = "".join(paragraph_text)
                paragraphs.append(text)
                
            # Write to output file
            os.makedirs(os.path.dirname(output_txt_path), exist_ok=True)
            with open(output_txt_path, 'w', encoding='utf-8') as f:
                f.write("\n".join(paragraphs))
                
            print(f"Success! Extracted {len(paragraphs)} paragraphs.")
            print(f"Saved content to: {output_txt_path}")
            return True
            
    except zipfile.BadZipFile:
        print(f"Error: {docx_path} is not a valid docx file!")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

if __name__ == "__main__":
    docx_file = "Proposal_AI_Open_ColonyAI.docx"
    output_file = "scratch/docx_content.txt"
    print(f"Extracting content from '{docx_file}'...")
    extract_docx_text(docx_file, output_file)
