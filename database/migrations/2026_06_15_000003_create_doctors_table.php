<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            // Optional login account for the doctor.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('full_name');
            $table->string('slug')->unique();
            $table->string('title')->nullable();          // Dr., Prof., etc.
            $table->json('specializations')->nullable();  // multi-value
            $table->json('qualifications')->nullable();    // multi-value
            $table->string('gender', 20)->nullable();

            // Hospital association: free-text (PRD) + optional relation.
            $table->string('hospital_name', 150)->nullable();
            $table->foreignId('hospital_id')->nullable()->constrained('hospitals')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();

            $table->unsignedSmallInteger('experience_years')->default(0);
            $table->decimal('consultation_fee', 10, 2)->default(0);
            $table->string('photo')->nullable();
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->text('bio')->nullable();

            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('featured_priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Top Rated Doctors ordering + active filtering.
            $table->index(['is_active', 'is_featured', 'featured_priority', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
