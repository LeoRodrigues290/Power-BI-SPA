import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { type SheetData } from "@/lib/excel";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from "@/lib/utils";

const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    let text = payload.value;
    if (text.length > 20) {
        text = text.substring(0, 20) + "...";
    }
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={4} textAnchor="end" fill="#cbd5e1" fontSize={11}>
                {text}
            </text>
        </g>
    );
};

export const ProjectCharts = ({ data }: { data: SheetData[] }) => {
    const [expandedSheets, setExpandedSheets] = useState<Record<string, boolean>>({});

    const toggleExpand = (sheetName: string) => {
        setExpandedSheets(prev => ({
            ...prev,
            [sheetName]: !prev[sheetName]
        }));
    };

    const getSeverity = (value: number, max: number) => {
        const ratio = value / max;
        if (ratio > 0.7) return { label: 'Alta', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
        if (ratio > 0.4) return { label: 'Média', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
        return { label: 'Baixa', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
    };

    return (
        <div className="space-y-10">
            {data.map((sheet) => {
                // Sort data descending
                const sortedData = [...sheet.data].sort((a, b) => b.value - a.value);
                const top10 = sortedData.slice(0, 10);
                const maxVal = sortedData[0]?.value || 1;

                return (
                    <div key={sheet.sheetName} className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                    {sheet.sheetName}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">Análise de qualidade e reportes</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold text-red-500">{sheet.sheetTotal}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Falhas</span>
                            </div>
                        </div>

                        {/* Chart Section - Top 10 Only */}
                        <div className="h-[350px] w-full mb-8 min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={top10} margin={{ left: 10, right: 10, top: 0, bottom: 0 }} barGap={2} barCategoryGap="20%">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#1e293b" opacity={0.3} />
                                    <XAxis
                                        type="number"
                                        stroke="#475569"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={130}
                                        tick={<CustomYAxisTick />}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', padding: '8px 12px' }}
                                        itemStyle={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px' }}
                                        formatter={(value: number | undefined) => [`${value} Ocorrências`, 'Falhas']}
                                        labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000}>
                                        {top10.map((_, index) => {
                                            return <Cell key={`cell-${index}`} fill={index < 3 ? '#f87171' : '#60a5fa'} />; // Top 3 Red, others Blue
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Main Offenders Summary */}
                        <div className="grid md:grid-cols-2 gap-8 border-t border-[#1e293b] pt-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Principais Ofensores</h4>
                                <div className="space-y-3">
                                    {top10.slice(0, 3).map((item, i) => {
                                        const severity = getSeverity(item.value, maxVal);
                                        return (
                                            <div key={i} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-red-400" : i === 1 ? "bg-orange-400" : "bg-blue-400")} />
                                                    <span className="text-sm text-slate-300 font-medium truncate max-w-[180px]" title={item.name}>{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", severity.color)}>
                                                        {severity.label}
                                                    </span>
                                                    <span className="text-sm font-bold text-white w-6 text-right">{item.value}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col justify-end items-end">
                                <button
                                    onClick={() => toggleExpand(sheet.sheetName)}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 group transition-colors"
                                >
                                    {expandedSheets[sheet.sheetName] ? "Ocultar relatório completo" : "Ver relatório completo"}
                                    {expandedSheets[sheet.sheetName] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Expandable Full Table */}
                        {expandedSheets[sheet.sheetName] && (
                            <div className="mt-6 border-t border-[#1e293b] pt-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-[#020617] rounded-lg border border-[#1e293b] overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#0f172a] text-slate-400 font-medium">
                                            <tr>
                                                <th className="p-3 pl-4">Descrição do Defeito</th>
                                                <th className="p-3 text-right pr-4">Ocorrências</th>
                                                <th className="p-3 text-right pr-4">% do Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1e293b]">
                                            {sortedData.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-[#0f172a]/50 transition-colors">
                                                    <td className="p-3 pl-4 text-slate-300">{item.name}</td>
                                                    <td className="p-3 text-right pr-4 font-semibold text-white">{item.value}</td>
                                                    <td className="p-3 text-right pr-4 text-slate-500">
                                                        {((item.value / sheet.sheetTotal) * 100).toFixed(1)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
