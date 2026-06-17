<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stat_counters', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->unsignedBigInteger('value')->default(0);
            $table->string('suffix', 10)->nullable();   // e.g. "+", "K"
            $table->string('icon')->nullable();          // emoji or short symbol
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stat_counters');
    }
};
