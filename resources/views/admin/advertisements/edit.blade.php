@extends('layouts.admin')

@section('title', 'Edit Advertisement')
@section('heading', 'Edit Advertisement')

@section('content')
    <x-admin.page-header :title="$advertisement->title"
        :breadcrumbs="[['label' => 'Advertisements', 'url' => route('admin.advertisements.index')], ['label' => 'Edit']]" />
    @include('admin.advertisements._form')
@endsection
