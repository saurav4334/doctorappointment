@extends('layouts.admin')

@section('title', 'Add Client')
@section('heading', 'Add Client')

@section('content')
    <x-admin.page-header title="Add Client"
        :breadcrumbs="[['label' => 'Corporate Clients', 'url' => route('admin.corporate-clients.index')], ['label' => 'Add']]" />
    @include('admin.corporate-clients._form')
@endsection
