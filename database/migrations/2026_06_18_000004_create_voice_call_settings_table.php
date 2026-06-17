<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_call_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(false);
            $table->string('api_endpoint')->default('https://dashboard.protiddhoni-bd.com/api/surveys/direct-tts');
            $table->text('api_token')->nullable();       // encrypted at rest
            $table->string('sender_number')->nullable();
            $table->string('voice_type', 10)->default('female'); // male | female
            $table->string('language_code', 5)->default('bn');   // bn | en
            $table->boolean('dtmf_enabled')->default(true);
            $table->string('test_number', 20)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_call_settings');
    }
};
