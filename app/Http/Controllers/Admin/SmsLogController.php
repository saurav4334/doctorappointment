<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SmsLog;
use App\Services\Sms\SmsService;
use Illuminate\Http\Request;

class SmsLogController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');
        $event = $request->query('event', '');
        $from = $request->query('from', '');
        $to = $request->query('to', '');

        $logs = SmsLog::query()
            ->when($search !== '', fn ($q) => $q->where('recipient_number', 'like', "%{$search}%"))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($event !== '', fn ($q) => $q->where('event_type', $event))
            ->when($from !== '', fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to !== '', fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $statusOptions = ['' => 'All Status', 'pending' => 'Pending', 'sent' => 'Sent', 'failed' => 'Failed', 'skipped' => 'Skipped'];
        $eventOptions = ['' => 'All Events'] + SmsService::EVENTS + ['test' => 'Test SMS'];

        return view('admin.sms.logs.index', compact('logs', 'search', 'status', 'event', 'from', 'to', 'statusOptions', 'eventOptions'));
    }
}
