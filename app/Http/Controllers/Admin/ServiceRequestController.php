<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceRequestController extends Controller
{
    public const STATUSES = ['pending', 'contacted', 'completed', 'cancelled'];

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $requests = ServiceRequest::query()
            ->with('service:id,title')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('patient_name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $statusOptions = ['' => 'All Status'] + array_combine(self::STATUSES, array_map('ucfirst', self::STATUSES));

        return view('admin.service-requests.index', compact('requests', 'search', 'status', 'statusOptions'));
    }

    public function setStatus(Request $request, ServiceRequest $serviceRequest)
    {
        $data = $request->validate(['status' => ['required', Rule::in(self::STATUSES)]]);
        $serviceRequest->update($data);

        return back()->with('success', 'Request marked as '.$data['status'].'.');
    }

    public function destroy(ServiceRequest $serviceRequest)
    {
        $serviceRequest->delete();

        return back()->with('success', 'Request deleted.');
    }
}
