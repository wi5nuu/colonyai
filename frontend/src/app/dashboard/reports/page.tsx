'use client'

import { FileText, Download, Calendar, TrendingUp } from 'lucide-react'

const mockReports = [
  {
    id: 'RPT-001',
    title: 'Monthly TPC Summary - March 2026',
    type: 'monthly_summary',
    analysesCount: 456,
    dateGenerated: '2026-04-01',
    format: 'PDF',
    size: '2.4 MB',
  },
  {
    id: 'RPT-002',
    title: 'Quality Control Report - Week 13',
    type: 'qc_report',
    analysesCount: 89,
    dateGenerated: '2026-03-31',
    format: 'CSV',
    size: '856 KB',
  },
  {
    id: 'RPT-003',
    title: 'Environmental Monitoring Summary',
    type: 'environmental',
    analysesCount: 234,
    dateGenerated: '2026-03-28',
    format: 'PDF',
    size: '3.1 MB',
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-primary-50">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">47</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-success-50">
              <Calendar className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-warning-50">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Analyses/Report</p>
              <p className="text-2xl font-semibold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generate New Report */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Generate New Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
            <FileText className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Daily Summary</p>
            <p className="text-sm text-gray-500 mt-1">All analyses from today</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
            <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Weekly Report</p>
            <p className="text-sm text-gray-500 mt-1">Past 7 days summary</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
            <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Custom Range</p>
            <p className="text-sm text-gray-500 mt-1">Select date range</p>
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Reports
        </h2>
        <div className="space-y-4">
          {mockReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center flex-1">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {report.title}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                    <span>{report.dateGenerated}</span>
                    <span>•</span>
                    <span>{report.analysesCount} analyses</span>
                    <span>•</span>
                    <span>{report.format}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <button className="ml-4 btn-primary flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
