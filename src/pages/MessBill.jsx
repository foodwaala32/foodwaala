import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useHostel } from '../context/HostelContext';
import { Receipt, Calendar, Minus, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

export default function MessBill() {
    const { user } = useAuth();
    const { messRate, leaveMode, breakfastRate, lunchRate, dinnerRate } = useHostel();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [monthLeaves, setMonthLeaves] = useState([]);
    const [loadingLeaves, setLoadingLeaves] = useState(false);

    if (!user) return <div className="p-8 text-center">Please log in to view bill.</div>;

    const now = new Date();
    const currentYearNum = now.getFullYear();
    const currentMonthNum = now.getMonth(); 

    const START_YEAR = 2026;
    const START_MONTH = 7; 

    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth(); 

    // Allow viewing up to next month
    const maxFutureDate = new Date(currentYearNum, currentMonthNum + 1, 1);
    const maxYearNum = maxFutureDate.getFullYear();
    const maxMonthNum = maxFutureDate.getMonth();

    const isLatestMonth = selectedYear > maxYearNum || (selectedYear === maxYearNum && selectedMonth >= maxMonthNum);
    const isEarliestMonth = selectedYear < START_YEAR || (selectedYear === START_YEAR && selectedMonth <= START_MONTH);

    const handlePrevMonth = () => {
        if (!isEarliestMonth) {
            setSelectedDate(new Date(selectedYear, selectedMonth - 1, 1));
        }
    };

    const handleNextMonth = () => {
        if (!isLatestMonth) {
            setSelectedDate(new Date(selectedYear, selectedMonth + 1, 1));
        }
    };

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    useEffect(() => {
        if (!user?.hostelId || !user?.messNumber) return;

        const fetchMonthLeaves = async () => {
            setLoadingLeaves(true);
            const startStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
            const endStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

            const { data, error } = await supabase
                .from('leaves')
                .select('leave_date, breakfast, lunch, dinner')
                .eq('status', 'Approved')
                .eq('hostel_id', user.hostelId)
                .eq('mess_number', user.messNumber)
                .gte('leave_date', startStr)
                .lte('leave_date', endStr);

            if (error) {
                console.error(error);
                setMonthLeaves([]);
            } else {
                setMonthLeaves(data);
            }
            setLoadingLeaves(false);
        };
        fetchMonthLeaves();
    }, [user?.hostelId, user?.messNumber, selectedYear, selectedMonth, daysInMonth]);

    let startDay = 1;
    if (user?.joinDate) {
        const [jY, jM, jD] = user.joinDate.split('-').map(Number);
        if (jY === selectedYear && (jM - 1) === selectedMonth) {
            startDay = Math.max(1, jD);
        } else if (jY > selectedYear || (jY === selectedYear && (jM - 1) > selectedMonth)) {
            startDay = daysInMonth + 1; 
        }
    }

    const eligibleDays = Math.max(0, daysInMonth - startDay + 1);

    let leaveCount = 0;
    let breakfastMissed = 0;
    let lunchMissed = 0;
    let dinnerMissed = 0;

    for (let day = startDay; day <= daysInMonth; day++) {
        const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const leave = monthLeaves.find(l => l.leave_date === dateKey);
        
        if (leave) {
            if (leaveMode === 'per_meal') {
                if (leave.breakfast) breakfastMissed++;
                if (leave.lunch) lunchMissed++;
                if (leave.dinner) dinnerMissed++;
            } else {
                leaveCount++;
            }
        }
    }

    let totalAmount = 0;
    let savings = 0;
    let activeDays = 0;
    
    const breakfastEaten = Math.max(0, eligibleDays - breakfastMissed);
    const lunchEaten = Math.max(0, eligibleDays - lunchMissed);
    const dinnerEaten = Math.max(0, eligibleDays - dinnerMissed);

    if (leaveMode === 'per_meal') {
        totalAmount = (breakfastEaten * breakfastRate) + (lunchEaten * lunchRate) + (dinnerEaten * dinnerRate);
        savings = (breakfastMissed * breakfastRate) + (lunchMissed * lunchRate) + (dinnerMissed * dinnerRate);
    } else {
        activeDays = Math.max(0, eligibleDays - leaveCount);
        totalAmount = activeDays * messRate;
        savings = leaveCount * messRate;
    }

    const monthName = selectedDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="space-y-8 animate-fade-in mx-auto max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Monthly Bill</h1>
                    <p className="text-gray-500 text-lg">Billing details for {monthName} {selectedYear}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth} disabled={isEarliestMonth} title={isEarliestMonth ? "Cannot view past months before current month" : "Previous Month"}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="font-semibold text-gray-900 min-w-[140px] text-center">
                        {monthName} {selectedYear}
                    </div>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isLatestMonth} title={isLatestMonth ? "Cannot view future months" : "Next Month"}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Payable</p>
                            <h2 className="text-4xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</h2>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Unpaid
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Due by 5th of next month</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {leaveMode === 'per_meal' ? (
                        <>
                            <div className="grid grid-cols-5 p-4 sm:px-6 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-2">Meal</div>
                                <div className="text-center">Rate</div>
                                <div className="text-center">Eaten</div>
                                <div className="text-right">Subtotal</div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="grid grid-cols-5 p-4 sm:px-6 items-center hover:bg-gray-50/30 transition-colors">
                                    <div className="col-span-2 text-sm font-medium text-gray-900">Breakfast</div>
                                    <div className="text-sm text-gray-500 text-center">₹{breakfastRate}</div>
                                    <div className="text-sm text-gray-500 text-center">{breakfastEaten} / {eligibleDays}</div>
                                    <div className="text-sm font-medium text-gray-900 text-right">₹{(breakfastEaten * breakfastRate).toLocaleString()}</div>
                                </div>
                                <div className="grid grid-cols-5 p-4 sm:px-6 items-center hover:bg-gray-50/30 transition-colors">
                                    <div className="col-span-2 text-sm font-medium text-gray-900">Lunch</div>
                                    <div className="text-sm text-gray-500 text-center">₹{lunchRate}</div>
                                    <div className="text-sm text-gray-500 text-center">{lunchEaten} / {eligibleDays}</div>
                                    <div className="text-sm font-medium text-gray-900 text-right">₹{(lunchEaten * lunchRate).toLocaleString()}</div>
                                </div>
                                <div className="grid grid-cols-5 p-4 sm:px-6 items-center hover:bg-gray-50/30 transition-colors">
                                    <div className="col-span-2 text-sm font-medium text-gray-900">Dinner</div>
                                    <div className="text-sm text-gray-500 text-center">₹{dinnerRate}</div>
                                    <div className="text-sm text-gray-500 text-center">{dinnerEaten} / {eligibleDays}</div>
                                    <div className="text-sm font-medium text-gray-900 text-right">₹{(dinnerEaten * dinnerRate).toLocaleString()}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Total Days
                                </span>
                                <span className="text-sm font-medium text-gray-900 text-right">{daysInMonth} days</span>
                            </div>

                            <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Minus className="w-4 h-4 text-red-500" /> Leave Days
                                </span>
                                <span className="text-sm font-medium text-red-600 text-right">− {leaveCount} days</span>
                            </div>

                            <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors bg-blue-50/10">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary-600" /> Billable Days
                                </span>
                                <span className="text-sm font-semibold text-primary-700 text-right">{activeDays} days</span>
                            </div>

                            <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors">
                                <span className="text-sm text-gray-500">Cost per day</span>
                                <span className="text-sm font-medium text-gray-900 text-right">₹{messRate}</span>
                            </div>
                        </div>
                    )}

                    <Separator />

                    <div className="bg-gray-50/30 p-4 sm:px-6 text-center">
                        {leaveMode === 'full_day' && (
                            <p className="text-xs text-gray-400 font-mono">
                                ({daysInMonth} Total − {leaveCount} Leave) × ₹{messRate} = ₹{totalAmount.toLocaleString()}
                            </p>
                        )}
                        {savings > 0 && (
                            <p className="text-xs text-emerald-600 font-medium mt-1">
                                You saved ₹{savings.toLocaleString()} this month on leaves
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
