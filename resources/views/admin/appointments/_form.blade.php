@php $isEdit = $appointment->exists; @endphp

<form method="POST" action="{{ $isEdit ? route('admin.appointments.update', $appointment) : route('admin.appointments.store') }}">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Patient</h3>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="patient_name" label="Patient Name" :value="$appointment->patient_name" required />
                    <x-admin.input name="patient_phone" label="Phone" :value="$appointment->patient_phone" required />
                    <x-admin.input name="patient_email" label="Email" type="email" :value="$appointment->patient_email" class="sm:col-span-2" />
                </div>
            </x-admin.card>

            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Appointment</h3>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.field name="doctor_id" label="Doctor" required>
                        <select name="doctor_id" id="doctor_id" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary" required>
                            <option value="">Select doctor…</option>
                            @foreach ($doctors as $d)
                                <option value="{{ $d->id }}" @selected((int) old('doctor_id', $appointment->doctor_id) === $d->id)>{{ $d->full_name }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.field name="hospital_id" label="Hospital">
                        <select name="hospital_id" id="hospital_id" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            <option value="">None</option>
                            @foreach ($hospitals as $h)
                                <option value="{{ $h->id }}" @selected((int) old('hospital_id', $appointment->hospital_id) === $h->id)>{{ $h->name }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.input name="appointment_date" label="Date" type="date" :value="optional($appointment->appointment_date)->format('Y-m-d')" required />
                    <x-admin.input name="appointment_time" label="Time" type="time" :value="$appointment->appointment_time ? \Illuminate\Support\Str::substr($appointment->appointment_time, 0, 5) : ''" required />
                    <x-admin.textarea name="notes" label="Notes" :value="$appointment->notes" class="sm:col-span-2" />
                </div>
            </x-admin.card>
        </div>

        <div class="space-y-6">
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Status</h3>
                <div class="space-y-4">
                    <x-admin.field name="status" label="Appointment Status" required>
                        <select name="status" id="status" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            @foreach (['pending', 'confirmed', 'completed', 'cancelled'] as $s)
                                <option value="{{ $s }}" @selected(old('status', $appointment->status ?? 'pending') === $s)>{{ ucfirst($s) }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.field name="payment_status" label="Payment Status" required>
                        <select name="payment_status" id="payment_status" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            @foreach (['unpaid', 'paid', 'refunded'] as $s)
                                <option value="{{ $s }}" @selected(old('payment_status', $appointment->payment_status ?? 'unpaid') === $s)>{{ ucfirst($s) }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                </div>
            </x-admin.card>
            <div class="flex gap-3">
                <button type="submit" class="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{{ $isEdit ? 'Update' : 'Create' }}</button>
                <a href="{{ route('admin.appointments.index') }}" class="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted">Cancel</a>
            </div>
        </div>
    </div>
</form>
