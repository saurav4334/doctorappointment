<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_call_templates', function (Blueprint $table) {
            $table->id();
            $table->string('event')->unique();
            $table->string('title');
            $table->text('start_text');
            $table->text('question_text')->nullable();
            $table->text('end_text')->nullable();
            $table->text('dtmf1_text')->nullable();
            $table->text('dtmf2_text')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_call_templates');
    }
};
