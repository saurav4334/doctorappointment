@extends('layouts.admin')

@section('title', 'Edit Hospital')
@section('heading', 'Edit Hospital')

@section('content')
    <x-admin.page-header :title="$hospital->name"
        :breadcrumbs="[['label' => 'Hospitals', 'url' => route('admin.hospitals.index')], ['label' => 'Edit']]" />
    @include('admin.hospitals._form')
@endsection
