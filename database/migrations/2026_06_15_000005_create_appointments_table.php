<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            // Patient may be a registered user or a guest booking.
            $table->foreignId('patient_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
            $table->foreignId('hospital_id')->nullable()->constrained('hospitals')->nullOnDelete();

            $table->string('patient_name');
            $table->string('patient_phone', 20);
            $table->string('patient_email')->nullable();

            $table->date('appointment_date');
            $table->time('appointment_time');

            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['doctor_id', 'appointment_date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
