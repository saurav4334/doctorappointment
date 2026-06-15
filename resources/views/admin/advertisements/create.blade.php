@extends('layouts.admin')

@section('title', 'Add Advertisement')
@section('heading', 'Add Advertisement')

@section('content')
    <x-admin.page-header title="Add Advertisement"
        :breadcrumbs="[['label' => 'Advertisements', 'url' => route('admin.advertisements.index')], ['label' => 'Add']]" />
    @include('admin.advertisements._form')
@endsection
