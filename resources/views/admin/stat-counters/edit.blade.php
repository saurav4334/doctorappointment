@extends('layouts.admin')

@section('title', 'Edit Counter')
@section('heading', 'Edit Counter')

@section('content')
    <x-admin.page-header :title="$counter->title"
        :breadcrumbs="[['label' => 'Stat Counters', 'url' => route('admin.stat-counters.index')], ['label' => 'Edit']]" />
    @include('admin.stat-counters._form')
@endsection
