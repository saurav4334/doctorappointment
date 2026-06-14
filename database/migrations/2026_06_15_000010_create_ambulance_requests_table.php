<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ambulance_requests', function (Blueprint $table) {
            $table->id();
            $table->string('patient_name');
            $table->string('phone', 20);
            $table->string('pickup_location');
            $table->string('destination')->nullable();
            $table->string('ambulance_type')->default('standard');
            $table->string('emergency_level')->default('normal');
            $table->enum('status', ['pending', 'dispatched', 'completed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ambulance_requests');
    }
};
