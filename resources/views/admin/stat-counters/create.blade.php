@extends('layouts.admin')

@section('title', 'Add Counter')
@section('heading', 'Add Counter')

@section('content')
    <x-admin.page-header title="Add Counter"
        :breadcrumbs="[['label' => 'Stat Counters', 'url' => route('admin.stat-counters.index')], ['label' => 'Add']]" />
    @include('admin.stat-counters._form')
@endsection
