@extends('layouts.admin')

@section('title', 'Edit Client')
@section('heading', 'Edit Client')

@section('content')
    <x-admin.page-header :title="$client->name"
        :breadcrumbs="[['label' => 'Corporate Clients', 'url' => route('admin.corporate-clients.index')], ['label' => 'Edit']]" />
    @include('admin.corporate-clients._form')
@endsection
