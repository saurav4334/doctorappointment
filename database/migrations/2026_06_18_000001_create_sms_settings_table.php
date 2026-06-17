<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_settings', function (Blueprint $table) {
            $table->id();
            $table->string('api_base_url')->default('https://portal.notifybd.com/api/v1/sms/send');
            $table->text('api_key')->nullable();        // encrypted at rest
            $table->string('sender_id')->nullable();
            $table->string('sms_type', 20)->default('text'); // text | unicode
            $table->string('default_country_code', 5)->default('880');
            $table->boolean('enabled')->default(false);
            $table->string('admin_phone', 20)->nullable(); // recipient for admin-side alerts
            $table->string('test_number', 20)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_settings');
    }
};
