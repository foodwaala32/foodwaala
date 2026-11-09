import { IndianRupee, TrendingDown, Calendar, Minus, CheckCircle2 } from 'lucide-react';

export default function BillSummary({ 
    totalDays, 
    leaveDays, 
    costPerDay, 
    month, 
    year, 
    leaveMode = 'full_day',
    mealBreakdown 
}) {
    if (leaveMode === 'per_meal' && mealBreakdown) {
        const { 
            breakfastRate, lunchRate, dinnerRate, 
            breakfastEaten, lunchEaten, dinnerEaten, 
            breakfastMissed, lunchMissed, dinnerMissed 
        } = mealBreakdown;

        const totalBreakfast = breakfastEaten * breakfastRate;
        const totalLunch = lunchEaten * lunchRate;
        const totalDinner = dinnerEaten * dinnerRate;
        const totalAmount = totalBreakfast + totalLunch + totalDinner;
        const savings = (breakfastMissed * breakfastRate) + (lunchMissed * lunchRate) + (dinnerMissed * dinnerRate);

        return (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Mess Bill Summary</h3>
                            <p className="text-sm text-primary-200">{month} {year}</p>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <div className="grid grid-cols-5 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wider px-6 py-3 border-b border-gray-100">
                        <div className="col-span-2">Meal</div>
                        <div className="text-center">Rate</div>
                        <div className="text-center">Eaten</div>
                        <div className="text-right">Subtotal</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {/* Breakfast */}
                        <div className="grid grid-cols-5 px-6 py-4 items-center">
                            <div className="col-span-2 text-sm font-medium text-gray-900">Breakfast</div>
                            <div className="text-sm text-gray-500 text-center">₹{breakfastRate}</div>
                            <div className="text-sm text-gray-500 text-center">{breakfastEaten}</div>
                            <div className="text-sm font-semibold text-gray-900 text-right">₹{totalBreakfast.toLocaleString()}</div>
                        </div>
                        {/* Lunch */}
                        <div className="grid grid-cols-5 px-6 py-4 items-center">
                            <div className="col-span-2 text-sm font-medium text-gray-900">Lunch</div>
                            <div className="text-sm text-gray-500 text-center">₹{lunchRate}</div>
                            <div className="text-sm text-gray-500 text-center">{lunchEaten}</div>
                            <div className="text-sm font-semibold text-gray-900 text-right">₹{totalLunch.toLocaleString()}</div>
                        </div>
                        {/* Dinner */}
                        <div className="grid grid-cols-5 px-6 py-4 items-center">
                            <div className="col-span-2 text-sm font-medium text-gray-900">Dinner</div>
                            <div className="text-sm text-gray-500 text-center">₹{dinnerRate}</div>
                            <div className="text-sm text-gray-500 text-center">{dinnerEaten}</div>
                            <div className="text-sm font-semibold text-gray-900 text-right">₹{totalDinner.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-emerald-100 border-t border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-700">Total Payable</p>
                            <p className="text-xs text-emerald-600 mt-0.5">Due by end of month</p>
                        </div>
                        <p className="text-3xl font-bold text-emerald-700">₹{totalAmount.toLocaleString()}</p>
                    </div>
                </div>

                {savings > 0 && (
                    <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
                        <div className="flex items-center gap-2 justify-center">
                            <TrendingDown className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-amber-700">
                                You saved <span className="font-semibold">₹{savings.toLocaleString()}</span> on missed meals
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default full_day mode
    const activeDays = totalDays - leaveDays;
    const totalAmount = activeDays * costPerDay;
    const savings = leaveDays * costPerDay;

    const rows = [
        { label: 'Billing Period', value: `${month} ${year}`, icon: Calendar },
        { label: 'Total Days in Month', value: totalDays, icon: Calendar },
        { label: 'Leave Days Taken', value: leaveDays, icon: Minus, highlight: 'text-red-600' },
        { label: 'Active Days', value: activeDays, icon: Calendar },
        { label: 'Cost Per Day', value: `₹${costPerDay}`, icon: IndianRupee },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Mess Bill Summary</h3>
                        <p className="text-sm text-primary-200">{month} {year}</p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-50">
                {rows.map(({ label, value, icon: Icon, highlight }) => (
                    <div key={label} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{label}</span>
                        </div>
                        <span className={`text-sm font-semibold ${highlight || 'text-gray-900'}`}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                    ({totalDays} − {leaveDays}) × ₹{costPerDay} = ₹{totalAmount.toLocaleString()}
                </p>
            </div>

            <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-emerald-100 border-t border-emerald-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-emerald-700">Total Payable</p>
                        <p className="text-xs text-emerald-600 mt-0.5">Due by end of month</p>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">₹{totalAmount.toLocaleString()}</p>
                </div>
            </div>

            {savings > 0 && (
                <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
                    <div className="flex items-center gap-2 justify-center">
                        <TrendingDown className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-700">
                            You saved <span className="font-semibold">₹{savings.toLocaleString()}</span> by taking {leaveDays} day{leaveDays !== 1 ? 's' : ''} off
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
