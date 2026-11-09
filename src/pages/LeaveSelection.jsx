import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import LeaveCalendar from '../components/LeaveCalendar';
import { CalendarOff, Clock, Save, AlertTriangle, X, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useLeaves } from '../context/LeaveContext';
import { useAuth } from '../context/AuthContext';
import { useHostel } from '../context/HostelContext';

export default function LeaveSelection() {
    const { user } = useAuth();
    const { getLeavesByDate, addLeave, removeLeave, leaves } = useLeaves();
    const { cutoffTime, maxLeaves, leaveMode, breakfastRate, lunchRate, dinnerRate } = useHostel();
    const isUnlimited = maxLeaves === null;

    const [today, setToday] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    useEffect(() => {
        const interval = setInterval(() => {
            setToday(new Date());
        }, 60000); // 1 minute
        return () => clearInterval(interval);
    }, []);

    const [selectedDates, setSelectedDates] = useState([]);
    const [pendingChanges, setPendingChanges] = useState(false);
    
    // Meal Modal State
    const [mealModalDate, setMealModalDate] = useState(null);
    const [mealSelection, setMealSelection] = useState({ breakfast: false, lunch: false, dinner: false });

    // Initial load from DB
    useEffect(() => {
        if (!user) return;
        const myLeaves = Object.entries(leaves).reduce((acc, [date, leafRecords]) => {
            const myRecord = leafRecords.find(l => l.messNumber === user.messNumber);
            if (myRecord) {
                acc.push({
                    date,
                    isAdminGranted: myRecord.isAdminGranted,
                    breakfast: myRecord.breakfast ?? true,
                    lunch: myRecord.lunch ?? true,
                    dinner: myRecord.dinner ?? true
                });
            }
            return acc;
        }, []);
        setSelectedDates(myLeaves);
    }, [leaves, user]);

    const isTodayCutoffPassed = today.getHours() >= cutoffTime;

    const leavesThisMonth = selectedDates.filter((l) => {
        if (l.isAdminGranted) return false;
        const d = new Date(l.date + 'T00:00:00');
        // A leave counts if ANY meal is on leave
        const isLeaveActive = leaveMode === 'per_meal' ? (l.breakfast || l.lunch || l.dinner) : true;
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && isLeaveActive;
    }).length;

    const remainingLeaves = isUnlimited ? Infinity : maxLeaves - leavesThisMonth;
    const isCapReached = !isUnlimited && remainingLeaves <= 0;

    const handleDateToggle = (dateStr) => {
        const existingRecord = selectedDates.find(l => l.date === dateStr);

        if (existingRecord?.isAdminGranted) {
            toast.error("Admin-granted leaves cannot be modified.");
            return;
        }

        const dateObj = new Date(dateStr + 'T00:00:00');
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const isTomorrow = dateObj.getTime() === tomorrow.getTime();
        const isTodayPassed = now.getHours() >= cutoffTime;

        if (!existingRecord && isTomorrow && isTodayPassed) {
            toast.error(`Cutoff reached (8 PM). You can only apply for leave from day after tomorrow.`, {
                position: 'bottom-center',
                style: { borderRadius: '8px', background: '#1f2937', color: '#fff' },
            });
            return;
        }

        if (leaveMode === 'per_meal') {
            if (existingRecord) {
                setMealSelection({
                    breakfast: existingRecord.breakfast,
                    lunch: existingRecord.lunch,
                    dinner: existingRecord.dinner
                });
            } else {
                if (isCapReached) {
                    const d = new Date(dateStr + 'T00:00:00');
                    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                        toast.error(`Maximum ${maxLeaves} leave days reached for this month`, {
                            position: 'bottom-center',
                            style: { borderRadius: '8px', background: '#1f2937', color: '#fff' },
                        });
                        return;
                    }
                }
                setMealSelection({ breakfast: true, lunch: true, dinner: true });
            }
            setMealModalDate(dateStr);
        } else {
            // Full day mode behavior
            setPendingChanges(true);
            const isRemoving = !!existingRecord;
            
            if (!isRemoving && isCapReached) {
                const d = new Date(dateStr + 'T00:00:00');
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    toast.error(`Maximum ${maxLeaves} leave days reached for this month`, {
                        position: 'bottom-center',
                        style: { borderRadius: '8px', background: '#1f2937', color: '#fff' },
                    });
                    return;
                }
            }

            setSelectedDates((prev) =>
                isRemoving
                    ? prev.filter((l) => l.date !== dateStr)
                    : [...prev, { date: dateStr, isAdminGranted: false, breakfast: true, lunch: true, dinner: true }].sort((a, b) => a.date.localeCompare(b.date))
            );
        }
    };

    const handleMealModalConfirm = () => {
        setPendingChanges(true);
        if (!mealSelection.breakfast && !mealSelection.lunch && !mealSelection.dinner) {
            setSelectedDates(prev => prev.filter(l => l.date !== mealModalDate));
        } else {
            setSelectedDates(prev => {
                const existing = prev.find(l => l.date === mealModalDate);
                if (existing) {
                    return prev.map(l => l.date === mealModalDate ? { ...l, ...mealSelection } : l);
                } else {
                    return [...prev, { date: mealModalDate, isAdminGranted: false, ...mealSelection }].sort((a, b) => a.date.localeCompare(b.date));
                }
            });
        }
        setMealModalDate(null);
    };
    
    const handleMealModalRemove = () => {
        setPendingChanges(true);
        setSelectedDates(prev => prev.filter(l => l.date !== mealModalDate));
        setMealModalDate(null);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        const currentDbEntries = Object.entries(leaves).reduce((acc, [date, leafRecords]) => {
            const myRecord = leafRecords.find(l => l.messNumber === user.messNumber);
            if (myRecord) {
                acc.push({
                    date,
                    isAdminGranted: myRecord.isAdminGranted,
                    breakfast: myRecord.breakfast ?? true,
                    lunch: myRecord.lunch ?? true,
                    dinner: myRecord.dinner ?? true
                });
            }
            return acc;
        }, []);

        const toProcess = [];
        
        // Find adds and updates
        for (const sel of selectedDates) {
            const dbRecord = currentDbEntries.find(db => db.date === sel.date);
            if (!dbRecord || 
                (leaveMode === 'per_meal' && (dbRecord.breakfast !== sel.breakfast || dbRecord.lunch !== sel.lunch || dbRecord.dinner !== sel.dinner))) {
                toProcess.push({ type: 'add_or_update', record: sel });
            }
        }
        
        // Find removes
        for (const dbRecord of currentDbEntries) {
            if (!selectedDates.some(sel => sel.date === dbRecord.date)) {
                toProcess.push({ type: 'remove', record: dbRecord });
            }
        }

        if (toProcess.length === 0) {
            toast('No changes to save');
            return;
        }

        toast.loading('Saving changes...', { id: 'saving' });

        try {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const isTodayPassed = now.getHours() >= cutoffTime;

            for (const { type, record } of toProcess) {
                if (type === 'add_or_update') {
                    const dateObj = new Date(record.date + 'T00:00:00');
                    if (dateObj.getTime() === tomorrow.getTime() && isTodayPassed) {
                        const dbRec = currentDbEntries.find(db => db.date === record.date);
                        if (!dbRec) {
                             throw new Error(`Cutoff passed for ${record.date}. Please refresh or adjust your selection.`);
                        }
                    }
                }
            }

            for (const { type, record } of toProcess) {
                if (type === 'add_or_update') {
                    const meals = leaveMode === 'per_meal' ? { breakfast: record.breakfast, lunch: record.lunch, dinner: record.dinner } : { breakfast: true, lunch: true, dinner: true };
                    await addLeave(user.messNumber, record.date, user.id, false, meals);
                } else if (type === 'remove') {
                    await removeLeave(user.messNumber, record.date);
                }
            }

            toast.success('Leave preferences saved successfully', { id: 'saving' });
            setPendingChanges(false);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to save changes', { id: 'saving' });
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const futureDates = selectedDates.filter(l => l.date >= today.toISOString().split('T')[0]);

    const getProgressColor = () => {
        if (isUnlimited) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' };
        const ratio = leavesThisMonth / maxLeaves;
        if (ratio >= 1) return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' };
        if (ratio >= 0.8) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' };
        return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    };
    const progressColors = getProgressColor();
    const progressPercent = isUnlimited ? 0 : Math.min((leavesThisMonth / maxLeaves) * 100, 100);

    return (
        <div className="space-y-8 animate-fade-in mx-auto relative">
            <Toaster />
            
            {mealModalDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Select Meals for {formatDate(mealModalDate)}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setMealModalDate(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" checked={mealSelection.breakfast} onChange={(e) => setMealSelection(s => ({ ...s, breakfast: e.target.checked }))} />
                                    <div className="flex-1 flex justify-between">
                                        <span className="font-medium">Breakfast</span>
                                        <span className="text-gray-500 text-sm">₹{breakfastRate}</span>
                                    </div>
                                </label>
                                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" checked={mealSelection.lunch} onChange={(e) => setMealSelection(s => ({ ...s, lunch: e.target.checked }))} />
                                    <div className="flex-1 flex justify-between">
                                        <span className="font-medium">Lunch</span>
                                        <span className="text-gray-500 text-sm">₹{lunchRate}</span>
                                    </div>
                                </label>
                                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" checked={mealSelection.dinner} onChange={(e) => setMealSelection(s => ({ ...s, dinner: e.target.checked }))} />
                                    <div className="flex-1 flex justify-between">
                                        <span className="font-medium">Dinner</span>
                                        <span className="text-gray-500 text-sm">₹{dinnerRate}</span>
                                    </div>
                                </label>
                            </div>
                            
                            <div className="flex justify-between mt-4">
                                <Button variant="outline" size="sm" onClick={() => setMealSelection({ breakfast: true, lunch: true, dinner: true })}>
                                    Select All
                                </Button>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                                <Button variant="ghost" onClick={handleMealModalRemove}>Remove Leave</Button>
                                <Button onClick={handleMealModalConfirm}>Confirm</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Leave Management</h1>
                    <p className="text-gray-500 text-lg">Select dates you won't be eating at the mess.</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Cutoff: {cutoffTime > 12 ? cutoffTime - 12 : cutoffTime}:00 {cutoffTime >= 12 ? 'PM' : 'AM'} daily</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Calendar Card */}
                <div className="lg:col-span-2 space-y-6">
                    {isTodayCutoffPassed ? (
                        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Today's Cutoff Passed ({cutoffTime > 12 ? cutoffTime - 12 : cutoffTime}:00 {cutoffTime >= 12 ? 'PM' : 'AM'})</p>
                                <p className="text-sm text-amber-700 mt-0.5">
                                    You can only apply for leave for <strong>day after tomorrow</strong> onwards.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <Info className="w-5 h-5 text-blue-600 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">Advance Notice Required</p>
                                <p className="text-sm text-blue-700 mt-0.5">
                                    Same-day leave is not allowed. You can apply for leave from <strong>tomorrow</strong> onwards.
                                </p>
                            </div>
                        </div>
                    )}

                    {!isUnlimited && remainingLeaves <= 2 && remainingLeaves > 0 && (
                        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                            <Info className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Almost at leave limit</p>
                                <p className="text-sm text-amber-700 mt-0.5">
                                    Only <strong>{remainingLeaves}</strong> leave {remainingLeaves === 1 ? 'day' : 'days'} remaining this month.
                                </p>
                            </div>
                        </div>
                    )}

                    {!isUnlimited && isCapReached && (
                        <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-red-900">Leave limit reached</p>
                                <p className="text-sm text-red-700 mt-0.5">
                                    You've used all <strong>{maxLeaves}</strong> leave days for this month. Deselect a date to free up a slot.
                                </p>
                            </div>
                        </div>
                    )}

                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                        <LeaveCalendar
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            selectedDates={selectedDates}
                            onDateToggle={handleDateToggle}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                            maxLeaves={isUnlimited ? null : maxLeaves}
                            leavesUsedThisMonth={leavesThisMonth}
                            today={today}
                            cutoffTime={cutoffTime}
                            leaveMode={leaveMode}
                        />
                    </Card>
                </div>

                {/* Selected Dates Panel */}
                <div className="lg:col-span-1">
                    <Card className="border-gray-200 shadow-sm h-full flex flex-col">
                        <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50 space-y-4">
                            <CardTitle className="text-lg flex items-center justify-between">
                                Selected Dates
                                <Badge variant="secondary" className="bg-white border-gray-200">{futureDates.length}</Badge>
                            </CardTitle>

                            {/* Leave Quota Progress */}
                            <div className={`p-3 rounded-lg border ${progressColors.bg} ${progressColors.border}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-600">Monthly Quota</span>
                                    <span className={`text-xs font-bold ${progressColors.text}`}>
                                        {isUnlimited ? `${leavesThisMonth} / ∞` : `${leavesThisMonth} / ${maxLeaves}`}
                                    </span>
                                </div>
                                {!isUnlimited && (
                                    <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColors.bar}`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1.5">
                                    {isUnlimited
                                        ? 'Unlimited leaves available'
                                        : isCapReached
                                            ? 'No leaves remaining'
                                            : `${remainingLeaves} ${remainingLeaves === 1 ? 'day' : 'days'} remaining`
                                    }
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto max-h-[400px] p-0">
                            {futureDates.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <CalendarOff className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No upcoming leave dates selected.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {futureDates.map(entry => (
                                        <li key={entry.date} className="flex flex-col p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">{formatDate(entry.date)}</span>
                                                {entry.isAdminGranted ? (
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">Admin</Badge>
                                                ) : (
                                                    <button onClick={() => handleDateToggle(entry.date)} className="text-gray-400 hover:text-red-500 p-1">
                                                        {leaveMode === 'per_meal' ? <span className="text-xs font-medium text-primary-600">Edit</span> : <X className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>
                                            {leaveMode === 'per_meal' && (
                                                <div className="flex gap-1 mt-1">
                                                    {entry.breakfast && <Badge variant="outline" className="text-xs bg-white text-gray-600">B</Badge>}
                                                    {entry.lunch && <Badge variant="outline" className="text-xs bg-white text-gray-600">L</Badge>}
                                                    {entry.dinner && <Badge variant="outline" className="text-xs bg-white text-gray-600">D</Badge>}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
                            <Button onClick={handleSave} className="w-full" disabled={!pendingChanges}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
