import { ShieldCheck, ShieldX, Smartphone } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DownloadCertificateButton from "@/components/DownloadCertificateButton";

export default async function VerifyPage({
  params,
}: {
  params: { id: string };
}) {
  const warranty = await prisma.warranty.findUnique({
    where: { id: params.id },
    include: { device: { select: { brand: true, model: true, imei: true } } },
  });

  const isExpired = warranty ? warranty.expiresAt < new Date() : false;
  const isValid = !!warranty && warranty.status === "ACTIVE" && !isExpired;

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-16">
      <div className="glass w-full max-w-sm rounded-3xl p-8 text-center">
        <span
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
            isValid ? "bg-cyan-400 text-navy-900" : "bg-red-500/15 text-red-400"
          }`}
        >
          {isValid ? <ShieldCheck size={28} /> : <ShieldX size={28} />}
        </span>

        <h1 className="mt-5 font-display text-xl font-extrabold text-white">
          {!warranty
            ? "Warranty not found"
            : isValid
            ? "Warranty is active"
            : isExpired
            ? "Warranty has expired"
            : "Warranty is not active"}
        </h1>

        {warranty && (
          <>
            <div className="mt-4 flex items-center justify-center gap-2 text-white/70">
              <Smartphone size={14} />
              <span className="text-[13px]">
                {warranty.device.brand} {warranty.device.model}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-white/40">
              IMEI ••••••{warranty.device.imei.slice(-4)}
            </p>

            <div className="mt-6 space-y-2 rounded-xl bg-white/5 p-4 text-left text-[12.5px] text-white/80">
              <div className="flex justify-between">
                <span className="text-white/50">Plan</span>
                <span className="font-medium">{warranty.tierLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Activated</span>
                <span className="font-medium">
                  {new Date(warranty.activatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Expires</span>
                <span className="font-medium">
                  {new Date(warranty.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {isValid && <DownloadCertificateButton />}
          </>
        )}

        <p className="mt-6 text-[11px] text-white/30">
          Verified against the Extra Shield warranty registry.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block text-[12.5px] font-semibold text-cyan-400"
        >
          Go to Extra Shield
        </Link>
      </div>
    </div>
  );
}