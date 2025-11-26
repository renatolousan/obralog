"use client";

import { useState } from "react";
import Image from "next/image"; // <--- Import adicionado
import { NewDevelopmentModal } from "./newDevelopment";
import { ReportsModal } from "./reportsModal";
import { DevelopmentsTable } from "./developmentTable";
import { useDevelopments } from "./hook/useDevelopment";
import { useRouter } from "next/navigation";

export default function DevelopmentsPage() {
  const router = useRouter();
  const { data, total } = useDevelopments();
  const [open, setOpen] = useState(false);
  const [openReports, setOpenReports] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3739a2] to-[#1a1b4b]">
      
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-[#3739a2] border-b border-white/10 px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <Image
              src="/uploads/auth/logo.png"
              alt="Logo Obralog"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white m-0">
            Obralog
          </h1>
        </div>

        <button
          className="px-4 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20 transition-colors font-medium text-sm"
          type="button"
          onClick={() => router.push("/pages/auth")}
        >
          Sair
        </button>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Empreendimentos</h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/pages/dashboard/managerial")}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
            >
              Dashboard Gerencial
            </button>
            <button
              onClick={() => setOpenReports(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 transition-colors border border-slate-500"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Relatórios
            </button>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5v14M5 12h14"
                />
              </svg>
              Novo
            </button>
          </div>
        </header>

        <DevelopmentsTable data={data} total={total} />

        <NewDevelopmentModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => {
            window.location.reload();
          }}
        />

        <ReportsModal
          open={openReports}
          onClose={() => setOpenReports(false)}
        />
      </main>
    </div>
  );
}