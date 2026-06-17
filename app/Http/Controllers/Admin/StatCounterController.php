<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StatCounterRequest;
use App\Models\StatCounter;
use Illuminate\Http\Request;

class StatCounterController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $counters = StatCounter::query()
            ->when($search !== '', fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->when($status !== '', fn ($q) => $q->where('is_active', (int) $status))
            ->orderBy('sort_order')
            ->paginate(10)
            ->withQueryString();

        return view('admin.stat-counters.index', compact('counters', 'search', 'status'));
    }

    public function create()
    {
        return view('admin.stat-counters.create', ['counter' => new StatCounter(['is_active' => true])]);
    }

    public function store(StatCounterRequest $request)
    {
        StatCounter::create($request->validated());

        return redirect()->route('admin.stat-counters.index')->with('success', 'Counter created.');
    }

    public function edit(StatCounter $statCounter)
    {
        return view('admin.stat-counters.edit', ['counter' => $statCounter]);
    }

    public function update(StatCounterRequest $request, StatCounter $statCounter)
    {
        $statCounter->update($request->validated());

        return redirect()->route('admin.stat-counters.index')->with('success', 'Counter updated.');
    }

    public function destroy(StatCounter $statCounter)
    {
        $statCounter->delete();

        return redirect()->route('admin.stat-counters.index')->with('success', 'Counter deleted.');
    }
}
