import React from 'react';

export default function HeatmapMatrix({ heatmapGrid = {}, activeCell = null, onCellClick }) {
  // Cell Risk Level Color Helper
  const getCellColor = (l, i) => {
    const score = l * i;
    const isActive = activeCell && activeCell.l === l && activeCell.i === i;
    let baseColor = '';

    if (score >= 15) {
      baseColor = 'bg-red-100 hover:bg-red-200 border-red-300 text-red-900';
    } else if (score >= 10) {
      baseColor = 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-900';
    } else if (score >= 5) {
      baseColor = 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900';
    } else {
      baseColor = 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-900';
    }

    if (isActive) {
      return `${baseColor} ring-4 ring-indigo-500 scale-105 z-10 font-bold shadow-lg`;
    }
    return `${baseColor} transition-all duration-150`;
  };

  const getScoreLevelName = (score) => {
    if (score >= 15) return 'Critical';
    if (score >= 10) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  };

  const likelihoodLabels = [
    { l: 5, name: 'L5: Almost Certain (เกิดบ่อยมาก)' },
    { l: 4, name: 'L4: Likely (เกิดขึ้นบ่อย)' },
    { l: 3, name: 'L3: Possible (อาจเกิดได้)' },
    { l: 2, name: 'L2: Unlikely (เกิดขึ้นน้อย)' },
    { l: 1, name: 'L1: Rare (นานๆ ครั้ง)' },
  ];

  const impactLabels = [
    { i: 1, name: 'I1: Negligible' },
    { i: 2, name: 'I2: Minor' },
    { i: 3, name: 'I3: Moderate' },
    { i: 4, name: 'I4: Major' },
    { i: 5, name: 'I5: Catastrophic' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
            5×5 Risk Heatmap Matrix
          </h3>
          <p className="text-xs text-slate-5-0 text-slate-500 mt-0.5">
            คลิกที่ช่อง Matrix เพื่อกรองรายการความเสี่ยงใน Risk Register ตามพิกัด Likelihood × Impact
          </p>
        </div>
        {activeCell && (
          <button
            onClick={() => onCellClick(null, null)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline bg-indigo-50 px-2.5 py-1 rounded"
          >
            Clear Matrix Filter (L{activeCell.l} × I{activeCell.i})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Matrix Grid */}
          <div className="grid grid-cols-[140px_repeat(5,_1fr)] gap-2 text-center">
            {/* Header Corner */}
            <div className="flex items-center justify-center font-bold text-xs text-slate-400 p-2 border-b border-slate-200">
              Likelihood \ Impact
            </div>
            {/* Impact Column Headers */}
            {impactLabels.map((imp) => (
              <div key={imp.i} className="font-semibold text-xs text-slate-700 p-2 border-b border-slate-200 bg-slate-50 rounded-t">
                {imp.name}
              </div>
            ))}

            {/* Matrix Rows (L5 down to L1) */}
            {likelihoodLabels.map(({ l, name }) => (
              <React.Fragment key={l}>
                {/* Likelihood Row Label */}
                <div className="font-semibold text-xs text-slate-700 flex items-center justify-start px-2 bg-slate-50 rounded-l text-left">
                  {name}
                </div>

                {/* 5 Impact Cells for this Likelihood */}
                {[1, 2, 3, 4, 5].map((i) => {
                  const count = heatmapGrid[`${l}_${i}`] || 0;
                  const score = l * i;
                  return (
                    <button
                      key={`${l}_${i}`}
                      onClick={() => onCellClick(l, i)}
                      className={`h-16 p-2 rounded-md border flex flex-col items-center justify-between cursor-pointer ${getCellColor(l, i)}`}
                    >
                      <span className="text-[10px] font-mono opacity-60 self-end">
                        {score} pts
                      </span>
                      <span className="text-lg font-extrabold my-auto">
                        {count > 0 ? (
                          <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full text-xs shadow-sm">
                            {count}
                          </span>
                        ) : (
                          <span className="opacity-30 text-xs">-</span>
                        )}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">
                        {getScoreLevelName(score)}
                      </span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Matrix Legend */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium text-slate-500">Risk Score Key (Score = L × I):</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-400 inline-block"></span> Low (1-4)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span> Medium (5-9)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-400 inline-block"></span> High (10-14)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Critical (15-25)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
