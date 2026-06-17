<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesImageUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\CorporateClientRequest;
use App\Models\CorporateClient;
use Illuminate\Http\Request;

class CorporateClientController extends Controller
{
    use HandlesImageUpload;

    public function index(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status', '');

        $clients = CorporateClient::query()
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($status !== '', fn ($q) => $q->where('is_active', (int) $status))
            ->orderBy('sort_order')
            ->paginate(12)
            ->withQueryString();

        return view('admin.corporate-clients.index', compact('clients', 'search', 'status'));
    }

    public function create()
    {
        return view('admin.corporate-clients.create', ['client' => new CorporateClient(['is_active' => true])]);
    }

    public function store(CorporateClientRequest $request)
    {
        $data = $request->validated();
        $data['logo'] = $this->storeImage($request->file('logo'), 'clients');

        CorporateClient::create($data);

        return redirect()->route('admin.corporate-clients.index')->with('success', 'Client created.');
    }

    public function edit(CorporateClient $corporateClient)
    {
        return view('admin.corporate-clients.edit', ['client' => $corporateClient]);
    }

    public function update(CorporateClientRequest $request, CorporateClient $corporateClient)
    {
        $data = $request->validated();
        $data['logo'] = $this->storeImage($request->file('logo'), 'clients', $corporateClient->logo);

        $corporateClient->update($data);

        return redirect()->route('admin.corporate-clients.index')->with('success', 'Client updated.');
    }

    public function destroy(CorporateClient $corporateClient)
    {
        $this->deleteImage($corporateClient->logo);
        $corporateClient->delete();

        return redirect()->route('admin.corporate-clients.index')->with('success', 'Client deleted.');
    }
}
