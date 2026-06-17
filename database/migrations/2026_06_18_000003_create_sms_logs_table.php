<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();
            $table->string('recipient_number', 20)->nullable();
            $table->text('message')->nullable();
            $table->string('event_type')->nullable();
            $table->string('provider')->default('notifybd');
            $table->string('status')->default('pending'); // pending | sent | failed | skipped
            $table->text('response_body')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
            $table->index('event_type');
            $table->index('recipient_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_logs');
    }
};
