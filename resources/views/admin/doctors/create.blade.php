@extends('layouts.admin')

@section('title', 'Add Doctor')
@section('heading', 'Add Doctor')

@section('content')
    <x-admin.page-header title="Add Doctor"
        :breadcrumbs="[['label' => 'Doctors', 'url' => route('admin.doctors.index')], ['label' => 'Add']]" />

    @include('admin.doctors._form')

    <p class="mt-4 text-sm text-muted-foreground">Save the doctor first, then open it again to manage weekly schedules.</p>
@endsection
