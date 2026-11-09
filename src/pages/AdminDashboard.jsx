import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Users, AlertCircle, UtensilsCrossed, Coffee, Soup } from 'lucide-react';
import { useStudents } from '../context/StudentContext';
import { useLeaves } from '../context/LeaveContext';
import { useHostel } from '../context/HostelContext';

export default function AdminDashboard() {
    const { students, loading: studentsLoading } = useStudents();
    const { getLeavesByDate, loading: leavesLoading } = useLeaves();
    const { leaveMode } = useHostel();

    const isLoading = studentsLoading || leavesLoading;

    // Calculate stats
    const today = new Date().toLocaleDateString('en-CA');
    const totalStudents = students.length;
    const todayLeaves = getLeavesByDate(today) || [];
    
    const leavesTodayCount = todayLeaves.length; // Students with ANY leave today
    const activeToday = totalStudents - leavesTodayCount;
    const attendancePercentage = totalStudents > 0 ? Math.round((activeToday / totalStudents) * 100) : 0;

    // Per-meal calculations
    const breakfastLeaves = todayLeaves.filter(l => l.breakfast).length;
    const lunchLeaves = todayLeaves.filter(l => l.lunch).length;
    const dinnerLeaves = todayLeaves.filter(l => l.dinner).length;

    const stats = leaveMode === 'per_meal' ? [
        {
            label: 'Total Students',
            value: totalStudents,
            desc: 'Registered students',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Breakfast Today',
            value: totalStudents - breakfastLeaves,
            desc: `${breakfastLeaves} on leave`,
            icon: Coffee,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Lunch Today',
            value: totalStudents - lunchLeaves,
            desc: `${lunchLeaves} on leave`,
            icon: Soup,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Dinner Today',
            value: totalStudents - dinnerLeaves,
            desc: `${dinnerLeaves} on leave`,
            icon: UtensilsCrossed,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Any Leave Today',
            value: leavesTodayCount,
            desc: 'Students with partial/full leave',
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ] : [
        {
            label: 'Total Students',
            value: totalStudents,
            desc: 'Registered students',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Active Today',
            value: activeToday,
            desc: `${attendancePercentage}% attendance`,
            icon: UtensilsCrossed,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Leave Today',
            value: leavesTodayCount,
            desc: 'Students on leave',
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-gray-500 mt-2">Welcome back, Admin. Here's today's summary.</p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 ${leaveMode === 'per_meal' ? 'lg:grid-cols-5' : ''} gap-6`}>
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-24 mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                )}
                                {isLoading ? (
                                    <Skeleton className="h-4 w-32 mt-1" />
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
