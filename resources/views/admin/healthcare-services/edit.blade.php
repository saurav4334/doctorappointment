@extends('layouts.admin')

@section('title', 'Edit Service')
@section('heading', 'Edit Service')

@section('content')
    <x-admin.page-header :title="$service->title"
        :breadcrumbs="[['label' => 'Healthcare Services', 'url' => route('admin.healthcare-services.index')], ['label' => 'Edit']]" />
    @include('admin.healthcare-services._form')
@endsection
