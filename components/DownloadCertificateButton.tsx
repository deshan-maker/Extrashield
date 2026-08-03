"use client";

import { Download } from "lucide-react";

export default function DownloadCertificateButton() {
  return (
    <button
      onClick={() => window.print()}
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-[12.5px] font-semibold text-navy-900"
    >
      <Download size={14} />
      Download certificate (PDF)
    </button>
  );
}
