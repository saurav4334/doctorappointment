@extends('layouts.admin')

@section('title', 'Edit Department')
@section('heading', 'Edit Department')

@section('content')
    <x-admin.page-header :title="$department->name"
        :breadcrumbs="[['label' => 'Departments', 'url' => route('admin.departments.index')], ['label' => 'Edit']]" />
    @include('admin.departments._form')
@endsection
