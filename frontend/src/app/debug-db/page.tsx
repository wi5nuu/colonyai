import { execSync } from "child_process";
import fs from "fs";

export const dynamic = "force-dynamic";

export default function DebugDbPage() {
  let output = "";
  try {
    execSync("python d:\\lombapuai\\scratch\\query_json.py");
    output = fs.readFileSync("d:\\lombapuai\\scratch\\json_log.txt", "utf-8");
  } catch (error: any) {
    output = `Error: ${error.message}`;
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", background: "#f8fafc", color: "#0f172a", minHeight: "100vh" }}>
      <h1>Dashboard Status Diagnostics</h1>
      <pre style={{ background: "#ffffff", padding: 20, border: "1px solid #e2e8f0", borderRadius: 8 }}>
        {output || "No diagnostics available."}
      </pre>
    </div>
  );
}
