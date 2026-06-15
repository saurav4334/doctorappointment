@extends('layouts.admin')

@section('title', 'New Appointment')
@section('heading', 'New Appointment')

@section('content')
    <x-admin.page-header title="New Appointment"
        :breadcrumbs="[['label' => 'Appointments', 'url' => route('admin.appointments.index')], ['label' => 'New']]" />
    @include('admin.appointments._form')
@endsection
