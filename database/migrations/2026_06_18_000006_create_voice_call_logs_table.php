<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_call_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->string('recipient_number', 20)->nullable();
            $table->string('request_id')->nullable();
            $table->string('event_type')->nullable();
            $table->string('provider')->default('protiddhoni');
            $table->json('payload')->nullable();
            $table->json('response')->nullable();
            $table->string('status')->default('pending'); // pending | sent | failed | skipped
            $table->text('error_message')->nullable();
            $table->string('dtmf_response')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('recipient_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_call_logs');
    }
};
