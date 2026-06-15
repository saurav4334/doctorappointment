@extends('layouts.admin')

@section('title', 'Add Hospital')
@section('heading', 'Add Hospital')

@section('content')
    <x-admin.page-header title="Add Hospital"
        :breadcrumbs="[['label' => 'Hospitals', 'url' => route('admin.hospitals.index')], ['label' => 'Add']]" />
    @include('admin.hospitals._form')
@endsection
