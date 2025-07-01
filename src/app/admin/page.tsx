'use client'

import {
  Users, ShoppingCart, DollarSign, AlertTriangle,
  TrendingUp, TrendingDown, Clock, CheckCircle,
  XCircle, Calendar, ArrowUpRight, Eye
} from 'lucide-react'
import { useSearchParams } from 'next/navigation';
import { useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';

import { UserContext } from '@/context/user-context';

export default function AdminHome() {
  const searchParams = useSearchParams();
  const context = useContext(UserContext);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const statusParam = searchParams.get('status');

    if (errorParam === '1') {
      toast.error('Something went wrong. You’ve been redirected.');
    }

    if (statusParam === 'login') {
      toast.success('Welcome! You are now logged in.');
    }

    if (errorParam || statusParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('status');
      window.history.replaceState(null, '', url.toString());
    }
  }, [searchParams]);

  if (!context) return <div>Loading context...</div>;
  const { user, loading } = context;

  const stats = [
    {
      title: "Total Users",
      value: "1,209",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "blue"
    },
    {
      title: "Orders Today",
      value: "845",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "green"
    },
    {
      title: "Revenue",
      value: "₹1,23,450",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      color: "blue"
    },
    {
      title: "Low Inventory",
      value: "14 Items",
      change: "-2 items",
      trend: "down",
      icon: AlertTriangle,
      color: "amber"
    }
  ];

  const recentOrders = [
    { id: "#1023", customer: "John Doe", amount: "₹2,450", status: "completed", time: "2 mins ago" },
    { id: "#1022", customer: "Sarah Wilson", amount: "₹1,200", status: "pending", time: "5 mins ago" },
    { id: "#1021", customer: "Mike Johnson", amount: "₹890", status: "failed", time: "8 mins ago" },
    { id: "#1020", customer: "Emma Davis", amount: "₹3,200", status: "completed", time: "12 mins ago" },
    { id: "#1019", customer: "Alex Chen", amount: "₹650", status: "pending", time: "15 mins ago" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">

      {/* Header Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {loading ? 'Loading...' : `Welcome back, ${user?.name || 'Admin'} 👋`}
            </h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your platform today.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'amber' ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'amber' ? 'text-amber-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">User Growth</h4>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View Details <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">Chart Component</p>
              <p className="text-sm text-blue-500">User growth analytics</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Revenue Over Time</h4>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View Details <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-green-600 font-medium">Chart Component</p>
              <p className="text-sm text-green-500">Revenue analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Recent Orders</h4>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          {recentOrders.map((order, index) => (
            <div key={order.id} className="p-6 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{order.amount}</p>
                  <p className="text-sm text-gray-500">{order.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
