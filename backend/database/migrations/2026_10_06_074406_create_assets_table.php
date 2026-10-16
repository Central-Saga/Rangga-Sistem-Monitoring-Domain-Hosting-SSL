<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('type')->index();
            $table->string('name');
            $table->string('provider')->nullable();
            $table->decimal('renewal_cost', 14, 2)->default(0);
            $table->string('billing_cycle')->default('yearly');
            $table->date('start_date')->nullable();
            $table->date('expired_date')->index();
            $table->boolean('auto_renew')->default(false);
            $table->string('status')->default('active')->index();
            $table->jsonb('metadata')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
