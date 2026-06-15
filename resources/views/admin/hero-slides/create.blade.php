@extends('layouts.admin')

@section('title', 'Add Hero Slide')
@section('heading', 'Add Hero Slide')

@section('content')
    <x-admin.page-header title="Add Hero Slide"
        :breadcrumbs="[['label' => 'Hero Slides', 'url' => route('admin.hero-slides.index')], ['label' => 'Add']]" />
    @include('admin.hero-slides._form')
@endsection
