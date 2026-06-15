@extends('layouts.admin')

@section('title', 'Edit Hero Slide')
@section('heading', 'Edit Hero Slide')

@section('content')
    <x-admin.page-header :title="$heroSlide->title"
        :breadcrumbs="[['label' => 'Hero Slides', 'url' => route('admin.hero-slides.index')], ['label' => 'Edit']]" />
    @include('admin.hero-slides._form')
@endsection
