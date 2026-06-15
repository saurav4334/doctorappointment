<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Maps a Supabase source row (table + UUID) to the new MySQL primary key.
     * Enables idempotent re-imports and remapping of foreign keys (UUID → bigint).
     */
    public function up(): void
    {
        Schema::create('import_maps', function (Blueprint $table) {
            $table->id();
            $table->string('source_table', 100);
            $table->string('source_id', 64);
            $table->unsignedBigInteger('target_id');
            $table->timestamps();

            $table->unique(['source_table', 'source_id']);
            $table->index(['source_table', 'target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_maps');
    }
};
