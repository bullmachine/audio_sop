import React, { useEffect, useState } from "react";
import { CalendarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, BarChartOutlined, FilterOutlined } from "@ant-design/icons";
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
  totalDuration: number; // Time from first to last audio
  playbackDuration: number; // Sum of individual play times
  avgDuration: number;
  avgCompletionPercentage: number;
  loginTimes?: string[];
  logoutTimes?: (string | null)[];
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

      // Store debug data
      setDebugData({ dateWise, summary, params });

      // Group by employee -> date -> machine -> SOP
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
          };
        }

        // Find or create date entry
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

        // Find or create machine entry
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

        // Add SOP data
        machineEntry.sops.push(item);
        machineEntry.totalSessions += item.totalSessions;
        machineEntry.completedSessions += item.completedSessions;
        machineEntry.totalDuration += item.totalDuration;

        // Update date totals
        dateEntry.totalSessions += item.totalSessions;
        dateEntry.completedSessions += item.completedSessions;
        dateEntry.totalDuration += item.totalDuration;
      });

      // Sort dates descending and calculate unique machines
      Object.values(grouped).forEach(emp => {
        emp.dates.sort((a, b) => b.date.localeCompare(a.date));
        emp.dates.forEach(date => {
          date.machines.sort((a, b) => {
            const aMachine = a.machine_number || '';
            const bMachine = b.machine_number || '';
            return aMachine.localeCompare(bMachine);
          });
        });

        // Calculate unique machines
        const machines = new Set<string>();
        emp.dates.forEach(date => {
          date.machines.forEach(machine => {
            if (machine.machine_number) machines.add(machine.machine_number);
          });
        });
        emp.uniqueMachines = machines.size;
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
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
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

  return (
    <div className="w-full pb-28">
      <Breadcrumbs
        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg dark:from-gray-800 dark:to-gray-800"
        headTitle="Employee Analysis"
        items={[{ label: "Reports", path: "/reports" }, { label: "Employee Analysis", path: "/employee-analysis" }]}
      />

      <div className="mb-6 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <BarChartOutlined /> Employee Date-wise Analysis
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View audio tracking analysis by employee with date-wise breakdown
            </p>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <InfoCircleOutlined /> {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>

        {/* Debug Panel */}
        {showDebug && debugData && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Debug Information</h4>
            <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
              <div><strong>Request Params:</strong> {JSON.stringify(debugData.params, null, 2)}</div>
              <div><strong>DateWise Records:</strong> {debugData.dateWise.length} records</div>
              <div><strong>Summary Records:</strong> {debugData.summary.length} records</div>
              <div className="max-h-40 overflow-auto">
                <strong>Sample DateWise Data:</strong>
                <pre className="mt-1 text-xs">{JSON.stringify(debugData.dateWise.slice(0, 2), null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            placeholder="Employee Code (Optional)"
            value={empCode}
            onChange={(e) => setEmpCode(e.target.value)}
          />
          <Input
            placeholder="Machine Number (Optional)"
            value={machineNumber}
            onChange={(e) => setMachineNumber(e.target.value)}
          />
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FilterOutlined /> {loading ? "Loading..." : "Apply Filters"}
        </button>
      </div>

      {/* Employee-wise Section with Date-wise Details */}
      {groupedData.length > 0 ? (
        <>
          {/* Overall Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Employees</p>
                  <p className="text-2xl font-bold">{groupedData.length}</p>
                </div>
                <UserOutlined className="text-3xl opacity-50" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold">{groupedData.reduce((sum, emp) => sum + emp.totalSessions, 0)}</p>
                </div>
                <BarChartOutlined className="text-3xl opacity-50" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed Sessions</p>
                  <p className="text-2xl font-bold">{groupedData.reduce((sum, emp) => sum + emp.completedSessions, 0)}</p>
                </div>
                <CheckCircleOutlined className="text-3xl opacity-50" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Duration</p>
                  <p className="text-2xl font-bold">{formatDuration(groupedData.reduce((sum, emp) => sum + emp.totalDuration, 0))}</p>
                </div>
                <ClockCircleOutlined className="text-3xl opacity-50" />
              </div>
            </div>
          </div>

          {/* Employee Cards */}
          <div className="space-y-6">
            {groupedData.map((employee) => (
              <div key={employee.emp_code} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                {/* Employee Summary Header */}
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserOutlined /> {employee.emp_code} - {employee.user_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {employee.dates.length} active days • {employee.uniqueMachines} unique machine(s)
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Total Sessions:</span> {employee.totalSessions}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Completed:</span> {employee.completedSessions}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Completion:</span>
                        <span className={`ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          completionRate(employee.completedSessions, employee.totalSessions) >= 80
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : completionRate(employee.completedSessions, employee.totalSessions) >= 50
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                          {completionRate(employee.completedSessions, employee.totalSessions)}%
                        </span>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Total Duration:</span> {formatDuration(employee.totalDuration)}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Avg Duration:</span> {formatDuration(employee.avgDuration)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date-wise Breakdown with Machines and SOPs */}
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CalendarOutlined /> Date-wise Breakdown (Machine & SOP-wise)
                </h4>
                <div className="space-y-4">
                  {employee.dates.map((dateItem, dateIndex) => (
                    <div key={dateIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {/* Date Header */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{dateItem.date}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {dateItem.machines.length} machine(s) • {dateItem.totalSessions} sessions • {formatDuration(dateItem.totalDuration)}
                        </span>
                      </div>

                      {/* Machines and SOPs */}
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {dateItem.machines.map((machine, machineIndex) => (
                          <div key={machineIndex} className="p-3">
                            {/* Machine Header */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {machine.machine_number || 'No Machine'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({machine.totalSessions} sessions • {formatDuration(machine.totalDuration)})
                              </span>
                            </div>

                            {/* SOPs Table */}
                            <div className="ml-4 overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">SOP</th>
                                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Cycle</th>
                                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Sessions</th>
                                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Completed</th>
                                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Completion %</th>
                                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Total Duration</th>
                                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-600 dark:text-gray-400">Playback Duration</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {machine.sops.map((sop, sopIndex) => (
                                    <tr key={sopIndex} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                      <td className="py-2 px-3 text-xs text-gray-900 dark:text-white">{sop.sop_title || 'Unknown SOP'}</td>
                                      <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300 text-center">{sop.cycle_number || 1}</td>
                                      <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300 text-center">{sop.totalSessions}</td>
                                      <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                          <CheckCircleOutlined className="text-green-500 text-xs" />
                                          {sop.completedSessions}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-xs text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          sop.avgCompletionPercentage >= 80
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                            : sop.avgCompletionPercentage >= 50
                                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                        }`}>
                                          {Math.round(sop.avgCompletionPercentage)}%
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                          <ClockCircleOutlined className="text-blue-500 text-xs" />
                                          {formatDuration(sop.totalDuration)}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                          <ClockCircleOutlined className="text-purple-500 text-xs" />
                                          {formatDuration(sop.playbackDuration)}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        !loading && (
          <NoData
            title="No Analysis Data"
            message="No tracking data found for the selected filters."
            className="py-12"
          />
        )
      )}
    </div>
  );
};

export default EmployeeAnalysis;
