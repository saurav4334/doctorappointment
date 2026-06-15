@extends('layouts.admin')

@section('title', 'Add Department')
@section('heading', 'Add Department')

@section('content')
    <x-admin.page-header title="Add Department"
        :breadcrumbs="[['label' => 'Departments', 'url' => route('admin.departments.index')], ['label' => 'Add']]" />
    @include('admin.departments._form')
@endsection
