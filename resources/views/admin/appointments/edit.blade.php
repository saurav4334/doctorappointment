@extends('layouts.admin')

@section('title', 'Edit Appointment')
@section('heading', 'Edit Appointment')

@section('content')
    <x-admin.page-header :title="'Appointment #'.$appointment->id"
        :breadcrumbs="[['label' => 'Appointments', 'url' => route('admin.appointments.index')], ['label' => 'Edit']]" />
    @include('admin.appointments._form')
@endsection
