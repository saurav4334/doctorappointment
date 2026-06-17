@extends('layouts.admin')

@section('title', 'Add Service')
@section('heading', 'Add Service')

@section('content')
    <x-admin.page-header title="Add Service"
        :breadcrumbs="[['label' => 'Healthcare Services', 'url' => route('admin.healthcare-services.index')], ['label' => 'Add']]" />
    @include('admin.healthcare-services._form')
@endsection
