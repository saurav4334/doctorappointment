<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('home_services', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('title');
            $table->text('benefits')->nullable()->after('description');
            $table->string('contact_phone', 30)->nullable()->after('benefits');
        });
    }

    public function down(): void
    {
        Schema::table('home_services', function (Blueprint $table) {
            $table->dropColumn(['slug', 'benefits', 'contact_phone']);
        });
    }
};
