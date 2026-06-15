<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctor_schedules', function (Blueprint $table) {
            $table->unsignedSmallInteger('max_appointments')->default(1)->after('slot_duration');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->text('admin_notes')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('doctor_schedules', fn (Blueprint $t) => $t->dropColumn('max_appointments'));
        Schema::table('appointments', fn (Blueprint $t) => $t->dropColumn('admin_notes'));
    }
};
