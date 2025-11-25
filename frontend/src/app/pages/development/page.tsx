"use client";

import { useState } from "react";
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
    <>
      <button
        className=" m-10 w-25 absolute h-9 px-3.5 rounded-lg border border-red-900/50 bg-red-950/50 text-red-200 hover:bg-red-900/30 transition-colors font-medium"
        type="button"
        onClick={() => router.push("/pages/auth")}
      >
        Sair
      </button>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Empreendimentos</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/pages/dashboard/managerial")}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
            >
              Dashboard Gerencial
            </button>
            <button
              onClick={() => setOpenReports(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
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

        {/* tua tabela existente */}
        <DevelopmentsTable data={data} total={total} />

        {/* o modal */}
        <NewDevelopmentModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => {
            // opção simples:
            window.location.reload();

            // ou melhor (sem reload):
            // await refetch();
            // setOpen(false);
          }}
        />

        {/* modal de relatórios */}
        <ReportsModal
          open={openReports}
          onClose={() => setOpenReports(false)}
        />
      </main>
    </>
  );
}
