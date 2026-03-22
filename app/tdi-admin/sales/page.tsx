'use client'

import { TrendingUp, Target, Users, Calendar, DollarSign, FileText } from 'lucide-react'

export default function SalesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <p className="text-sm text-gray-500 mt-1">Pipeline, Prospects, and Revenue Forecasting</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <TrendingUp className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-indigo-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-indigo-700 max-w-md mx-auto">
          The Sales dashboard is under development. This will be your home for pipeline management,
          prospect tracking, and revenue forecasting.
        </p>
      </div>

      {/* Planned Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Pipeline View</h3>
          </div>
          <p className="text-sm text-gray-500">
            Kanban-style pipeline with deal stages, probability weighting, and drag-drop management.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Prospect CRM</h3>
          </div>
          <p className="text-sm text-gray-500">
            Track prospect contacts, touchpoints, and engagement history in one place.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Demo Scheduling</h3>
          </div>
          <p className="text-sm text-gray-500">
            Schedule and track product demos, follow-ups, and proposal deadlines.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Revenue Forecast</h3>
          </div>
          <p className="text-sm text-gray-500">
            Weighted pipeline forecasting with monthly/quarterly revenue projections.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Proposal Generator</h3>
          </div>
          <p className="text-sm text-gray-500">
            Auto-generate proposals from templates with scope, pricing, and terms.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Win/Loss Analysis</h3>
          </div>
          <p className="text-sm text-gray-500">
            Track conversion rates, deal velocity, and analyze wins vs. losses.
          </p>
        </div>
      </div>

    </div>
  )
}
