import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { type SheetData } from "@/lib/excel";

export const ProjectCharts = ({ data }: { data: SheetData[] }) => {
    return (
        <div className="space-y-6">
            {data.map((sheet) => (
                <div key={sheet.sheetName} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white tracking-wide border-l-4 border-blue-500 pl-3">
                            {sheet.sheetName}
                        </h3>
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 text-sm font-semibold rounded-full border border-red-500/10 shadow-lg shadow-red-500/10">
                            {sheet.sheetTotal} falhas
                        </span>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={sheet.data} margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#ffffff10" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={180}
                                    stroke="#e2e8f0"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#cbd5e1' }} // Text color for axis labels
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {sheet.data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ))}
        </div>
    );
};
