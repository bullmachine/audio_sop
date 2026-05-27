import React, { useEffect, useState } from "react";
import { ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, BarChartOutlined, FilterOutlined, ThunderboltOutlined, StarOutlined, TeamOutlined, DesktopOutlined, FileTextOutlined } from "@ant-design/icons";
import Breadcrumbs from "../../shared/component/Breadcrumbs";
import { Input } from "../../shared/component/Input";
import trackingService from "../../services/trackingService";
import { toast } from "react-toastify";
import NoData from "../../shared/component/NoData";

interface DateWiseData {
  emp_code: string;
  user_name: string;
  date: string;
  machine_number?: string;
  audio_sop_id?: string;
  sop_title?: string;
  cycle_number?: number;
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  dayTotalDuration: number;
  playbackDuration: number;
  avgDuration: number;
  avgCompletionPercentage: number;
}

interface SummaryData {
  emp_code: string;
  user_name: string;
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  avgDuration: number;
}

interface MachineWithSOPs {
  machine_number?: string;
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  sops: DateWiseData[];
}

interface DateWithMachines {
  date: string;
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  machines: MachineWithSOPs[];
}

interface EmployeeWithDates {
  emp_code: string;
  user_name: string;
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  avgDuration: number;
  uniqueMachines: number;
  dates: DateWithMachines[];
  mostUsedMachine?: string;
  mostPlayedSOP?: string;
  avgSessionDuration?: number;
}

const EmployeeAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [machineNumber, setMachineNumber] = useState("");
  const [groupedData, setGroupedData] = useState<EmployeeWithDates[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [overallTotals, setOverallTotals] = useState<{ totalSessions: number; completedSessions: number; totalDuration: number }>({ totalSessions: 0, completedSessions: 0, totalDuration: 0 });

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (empCode) params.emp_code = empCode;
      if (machineNumber) params.machine_number = machineNumber;

      const response = await trackingService.getEmployeeDateWiseAnalysis(params);
      const dateWise = response.data.dateWise || [];
      const summary = response.data.summary || [];
      const totals = response.data.overallTotals || { totalSessions: 0, completedSessions: 0, totalDuration: 0 };

      setDebugData({ dateWise, summary, totals, params });
      setOverallTotals(totals);

      const grouped: { [key: string]: EmployeeWithDates } = {};
      dateWise.forEach((item: DateWiseData) => {
        const empKey = item.emp_code;
        if (!grouped[empKey]) {
          const summaryItem = summary.find((s: SummaryData) => s.emp_code === empKey);
          grouped[empKey] = {
            emp_code: item.emp_code,
            user_name: item.user_name,
            totalSessions: summaryItem?.totalSessions || 0,
            completedSessions: summaryItem?.completedSessions || 0,
            totalDuration: summaryItem?.totalDuration || 0,
            avgDuration: summaryItem?.avgDuration || 0,
            uniqueMachines: 0,
            dates: [],
            avgSessionDuration: summaryItem?.avgDuration || 0,
          };
        }

        let dateEntry = grouped[empKey].dates.find(d => d.date === item.date);
        if (!dateEntry) {
          dateEntry = {
            date: item.date,
            totalSessions: 0,
            completedSessions: 0,
            totalDuration: 0,
            machines: [],
          };
          grouped[empKey].dates.push(dateEntry);
        }

        let machineEntry = dateEntry.machines.find(m => m.machine_number === item.machine_number);
        if (!machineEntry) {
          machineEntry = {
            machine_number: item.machine_number,
            totalSessions: 0,
            completedSessions: 0,
            totalDuration: 0,
            sops: [],
          };
          dateEntry.machines.push(machineEntry);
        }

        machineEntry.sops.push(item);
        machineEntry.totalSessions += item.totalSessions;
        machineEntry.completedSessions += item.completedSessions;
        machineEntry.totalDuration += item.totalDuration;

        dateEntry.totalSessions += item.totalSessions;
        dateEntry.completedSessions += item.completedSessions;
        dateEntry.totalDuration += item.totalDuration;
      });

      Object.values(grouped).forEach(emp => {
        emp.dates.sort((a, b) => b.date.localeCompare(a.date));
        emp.dates.forEach(date => {
          date.machines.sort((a, b) => {
            const aMachine = a.machine_number || "";
            const bMachine = b.machine_number || "";
            return aMachine.localeCompare(bMachine);
          });
        });

        const machines = new Set<string>();
        const machineUsage: { [key: string]: number } = {};
        const sopUsage: { [key: string]: number } = {};

        emp.dates.forEach(date => {
          date.machines.forEach(machine => {
            if (machine.machine_number) {
              machines.add(machine.machine_number);
              machineUsage[machine.machine_number] = (machineUsage[machine.machine_number] || 0) + machine.totalSessions;
            }
            machine.sops.forEach(sop => {
              if (sop.sop_title) {
                sopUsage[sop.sop_title] = (sopUsage[sop.sop_title] || 0) + sop.totalSessions;
              }
            });
          });
        });
        emp.uniqueMachines = machines.size;
        
        const mostUsedMachine = Object.entries(machineUsage).sort((a, b) => b[1] - a[1])[0];
        emp.mostUsedMachine = mostUsedMachine ? mostUsedMachine[0] : undefined;
        
        const mostPlayedSOP = Object.entries(sopUsage).sort((a, b) => b[1] - a[1])[0];
        emp.mostPlayedSOP = mostPlayedSOP ? mostPlayedSOP[0] : undefined;
      });

      setGroupedData(Object.values(grouped).sort((a, b) => a.emp_code.localeCompare(b.emp_code)));
    } catch (error) {
      toast.error("Failed to fetch analysis data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalysis();
    }
  }, [startDate, endDate]);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const completionRate = (completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const toggleEmployee = (empCode: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(empCode)) {
      newExpanded.delete(empCode);
    } else {
      newExpanded.add(empCode);
    }
    setExpandedEmployees(newExpanded);
  };

  const toggleDate = (empCode: string, date: string) => {
    const key = `${empCode}-${date}`;
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedDates(newExpanded);
  };

  return (
    <div className="w-full pb-28">
      <Breadcrumbs
        className="p-4 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-xl dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700"
        headTitle="Employee Analysis"
        items={[{ label: "Reports", path: "/reports" }, { label: "Employee Analysis", path: "/employee-analysis" }]}
      />

      <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <BarChartOutlined className="text-blue-600 dark:text-blue-400" /> Employee Date-wise Analysis
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Comprehensive audio tracking analytics with performance insights
            </p>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <InfoCircleOutlined /> {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>

        {showDebug && debugData && (
          <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
              <InfoCircleOutlined /> Debug Information
            </h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 font-mono">
              <div><strong className="text-amber-700 dark:text-amber-400">Request Params:</strong> {JSON.stringify(debugData.params, null, 2)}</div>
              <div><strong className="text-amber-700 dark:text-amber-400">DateWise Records:</strong> {debugData.dateWise.length} records</div>
              <div><strong className="text-amber-700 dark:text-amber-400">Summary Records:</strong> {debugData.summary.length} records</div>
              <div><strong className="text-amber-700 dark:text-amber-400">Overall Totals:</strong> {JSON.stringify(debugData.totals, null, 2)}</div>
              <div className="max-h-40 overflow-auto bg-white dark:bg-slate-800 p-2 rounded-lg">
                <strong className="text-amber-700 dark:text-amber-400">Sample DateWise Data:</strong>
                <pre className="mt-1 text-xs">{JSON.stringify(debugData.dateWise.slice(0, 2), null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Employee Code</label>
            <Input
              placeholder="Optional filter"
              value={empCode}
              onChange={(e) => setEmpCode(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Machine Number</label>
            <Input
              placeholder="Optional filter"
              value={machineNumber}
              onChange={(e) => setMachineNumber(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="mt-5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10"
        >
          <FilterOutlined /> {loading ? "Loading..." : "Apply Filters"}
        </button>
      </div>

      {groupedData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-blue-500/10 text-white border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">Total Employees</p>
                  <p className="text-3xl font-bold">{groupedData.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TeamOutlined className="text-2xl" />
                </div>
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-2xl shadow-xl shadow-purple-500/20 dark:shadow-purple-500/10 text-white border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium uppercase tracking-wide mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold">{overallTotals.totalSessions}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChartOutlined className="text-2xl" />
                </div>
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 rounded-2xl shadow-xl shadow-emerald-500/20 dark:shadow-emerald-500/10 text-white border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium uppercase tracking-wide mb-1">Completed</p>
                  <p className="text-3xl font-bold">{overallTotals.completedSessions}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircleOutlined className="text-2xl" />
                </div>
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-800 rounded-2xl shadow-xl shadow-amber-500/20 dark:shadow-amber-500/10 text-white border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-xs font-medium uppercase tracking-wide mb-1">Total Duration</p>
                  <p className="text-3xl font-bold">{formatDuration(overallTotals.totalDuration)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ClockCircleOutlined className="text-2xl" />
                </div>
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-rose-600 to-pink-600 dark:from-rose-700 dark:to-pink-800 rounded-2xl shadow-xl shadow-rose-500/20 dark:shadow-rose-500/10 text-white border border-rose-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-xs font-medium uppercase tracking-wide mb-1">Avg Duration</p>
                  <p className="text-3xl font-bold">{formatDuration(groupedData.length > 0 ? groupedData.reduce((sum, emp) => sum + emp.avgDuration, 0) / groupedData.length : 0)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ThunderboltOutlined className="text-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Employee</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sessions</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Completed</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Rate</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Time</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Avg/Session</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map((employee) => (
                  <React.Fragment key={employee.emp_code}>
                    <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-700/30 dark:hover:to-slate-700/30 cursor-pointer transition-all duration-200">
                      <td onClick={() => toggleEmployee(employee.emp_code)} className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                            {employee.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              {employee.emp_code}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {employee.user_name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <DesktopOutlined className="text-[10px]" /> {employee.uniqueMachines}
                              </span>
                              {employee.mostUsedMachine && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                  <StarOutlined className="text-[10px]" /> {employee.mostUsedMachine}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td onClick={() => toggleEmployee(employee.emp_code)} className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold">
                          {employee.totalSessions}
                        </span>
                      </td>
                      <td onClick={() => toggleEmployee(employee.emp_code)} className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-semibold">
                          {employee.completedSessions}
                        </span>
                      </td>
                      <td onClick={() => toggleEmployee(employee.emp_code)} className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${
                          completionRate(employee.completedSessions, employee.totalSessions) >= 80
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : completionRate(employee.completedSessions, employee.totalSessions) >= 50
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                        }`}>
                          {completionRate(employee.completedSessions, employee.totalSessions)}%
                        </span>
                      </td>
                      <td onClick={() => toggleEmployee(employee.emp_code)} className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {formatDuration(employee.totalDuration)}
                          </span>
                        </div>
                      </td>
                      <td onClick={() => toggleEmployee(employee.emp_code)} className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            {formatDuration(employee.avgSessionDuration || employee.avgDuration)}
                          </span>
                        </div>
                      </td>
                      <td onClick={() => toggleEmployee(employee.emp_code)} className="py-4 px-4 text-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          expandedEmployees.has(employee.emp_code) 
                            ? "bg-blue-600 text-white rotate-180" 
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                    {expandedEmployees.has(employee.emp_code) && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-700/30 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <div className="p-5 space-y-3">
                              {employee.dates.map((dateItem, dateIndex) => (
                                <div key={dateIndex} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden shadow-sm">
                                  <div
                                    onClick={() => toggleDate(employee.emp_code, dateItem.date)}
                                    className="bg-white dark:bg-slate-800 px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                                        <ClockCircleOutlined className="text-lg" />
                                      </div>
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{dateItem.date}</span>
                                        {employee.mostPlayedSOP && dateIndex === 0 && (
                                          <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                                            <FileTextOutlined className="text-[10px]" /> Top SOP: {employee.mostPlayedSOP}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-center px-3">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Machines</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{dateItem.machines.length}</div>
                                      </div>
                                      <div className="text-center px-3">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sessions</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{dateItem.totalSessions}</div>
                                      </div>
                                      <div className="text-center px-3">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Duration</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{formatDuration(dateItem.totalDuration)}</div>
                                      </div>
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                        expandedDates.has(`${employee.emp_code}-${dateItem.date}`) 
                                          ? "bg-purple-600 text-white rotate-180" 
                                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                      }`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                  {expandedDates.has(`${employee.emp_code}-${dateItem.date}`) && (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                                      {dateItem.machines.map((machine, machineIndex) => (
                                        <div key={machineIndex} className="p-5">
                                          <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                              <DesktopOutlined className="text-purple-600 dark:text-purple-400" />
                                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                {machine.machine_number || "No Machine"}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                              <span className="text-slate-600 dark:text-slate-400 font-medium">
                                                {machine.totalSessions} sessions
                                              </span>
                                              <span className="text-slate-600 dark:text-slate-400 font-medium">
                                                {formatDuration(machine.totalDuration)}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
                                            <table className="w-full">
                                              <thead>
                                                <tr className="bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                                                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">SOP</th>
                                                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Cycle</th>
                                                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sessions</th>
                                                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Completed</th>
                                                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Completion</th>
                                                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Duration</th>
                                                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Playback Duration</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {machine.sops.map((sop, sopIndex) => (
                                                  <tr key={sopIndex} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="py-3 px-4 text-xs font-semibold text-slate-900 dark:text-white">{sop.sop_title || "Unknown SOP"}</td>
                                                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 text-center">{sop.cycle_number || 1}</td>
                                                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 text-center">{sop.totalSessions}</td>
                                                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 text-center">{sop.completedSessions}</td>
                                                    <td className="py-3 px-3 text-xs text-center">
                                                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
                                                        sop.avgCompletionPercentage >= 80
                                                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                          : sop.avgCompletionPercentage >= 50
                                                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                                      }`}>
                                                        {Math.round(sop.avgCompletionPercentage)}%
                                                      </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 text-center font-semibold">{formatDuration(sop.totalDuration)}</td>
                                                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 text-center font-semibold">{formatDuration(sop.playbackDuration)}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        !loading && (
          <NoData
            title="No Analysis Data"
            message="No tracking data found for the selected filters."
            className="py-16"
          />
        )
      )}
    </div>
  );
};

export default EmployeeAnalysis;