<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Future analytics fields (PRD v2.0 §7.3). Columns prepared now; impression/
     * click tracking is not wired up yet.
     */
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->unsignedBigInteger('impression_count')->default(0)->after('sort_order');
            $table->unsignedBigInteger('click_count')->default(0)->after('impression_count');
            $table->timestamp('last_clicked_at')->nullable()->after('click_count');
        });
    }

    public function down(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropColumn(['impression_count', 'click_count', 'last_clicked_at']);
        });
    }
};
